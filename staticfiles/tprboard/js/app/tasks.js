// @ts-check
import { predictRecall } from './ebisu.js'
import { randomItem, shuffled } from './utils.js'

/**
 * @typedef {import('../types.js').DifficultyBreakdown} DifficultyBreakdown
 * @typedef {import('../types.js').DifficultyTarget} DifficultyTarget
 * @typedef {import('../types.js').LanguageProgress} LanguageProgress
 * @typedef {import('../types.js').LearningItem} LearningItem
 * @typedef {import('../types.js').LocaleTaskMap} LocaleTaskMap
 * @typedef {import('../types.js').ObjectRecord} ObjectRecord
 * @typedef {import('../types.js').PlacedObject} PlacedObject
 * @typedef {import('../types.js').PlayableRelationship} PlayableRelationship
 * @typedef {import('../types.js').RelationshipDefinition} RelationshipDefinition
 * @typedef {import('../types.js').RelationshipIndex} RelationshipIndex
 * @typedef {import('../types.js').RoundPlan} RoundPlan
 * @typedef {import('../types.js').RoundSelectionMode} RoundSelectionMode
 * @typedef {import('../types.js').SentenceLearningItem} SentenceLearningItem
 * @typedef {import('../types.js').TaskCandidate} TaskCandidate
 */

const BOARD_CAPACITY = 9
const HOURS_PER_MILLISECOND = 1 / (1000 * 60 * 60)
const MISSING_RELATIONSHIP_DIFFICULTY = 0.3
const OVERLAPPING_RELATIONSHIP_DIFFICULTY = 2
const REVIEW_MODE_PROBABILITY = 0.5
const REVIEW_RECALL_THRESHOLD = 0.8
const UNRELATED_RELATIONSHIP_DIFFICULTY = 1

/** @typedef {'isolated' | 'non-overlap' | 'overlap'} CandidateClass */

/**
 * @typedef {object} CandidateSimulation
 * @property {PlacedObject} candidate
 * @property {number} difficulty
 * @property {DifficultyBreakdown} difficultyBreakdown
 */

/**
 * @typedef {object} PlanRoundOptions
 * @property {LanguageProgress | null} languageProgress
 * @property {Map<string, LearningItem>} learningItemsByObjectName
 * @property {RelationshipIndex} relationshipIndex
 * @property {Map<string, SentenceLearningItem>} sentenceItemsByKey
 */

/**
 * @typedef {object} TaskSelection
 * @property {TaskCandidate} activeTask
 * @property {number | null} reviewPredictedRecall
 * @property {RoundSelectionMode} selectionMode
 */

/**
 * @typedef {object} ReviewTaskCandidate
 * @property {number} predictedRecall
 * @property {TaskCandidate} task
 */

/**
 * @param {PlayableRelationship} edge
 * @param {number} textIndex
 * @returns {TaskCandidate}
 */
function createTaskCandidate(edge, textIndex) {
  return {
    key: edge.key,
    sourceEffect: edge.sourceEffect,
    sourceName: edge.sourceName,
    targetEffect: edge.targetEffect,
    targetName: edge.targetName,
    text: edge.formulations[textIndex],
    textIndex,
  }
}

/**
 * @param {RelationshipIndex} relationshipIndex
 * @param {string} taskKey
 * @param {number} textIndex
 */
function resolveTaskCandidate(relationshipIndex, taskKey, textIndex) {
  const edge = relationshipIndex.playableEdgesByKey.get(taskKey)

  if (!edge || textIndex < 0 || textIndex >= edge.formulations.length) {
    return null
  }

  return createTaskCandidate(edge, textIndex)
}

/**
 * @param {string} sourceName
 * @param {string} targetName
 * @param {RelationshipDefinition} relationship
 * @param {LocaleTaskMap} localeTaskMap
 * @returns {PlayableRelationship | null}
 */
function findPlayableRelationship(sourceName, targetName, relationship, localeTaskMap) {
  const [verb, sourceEffect, targetEffect] = relationship
  const key = `${sourceName}_${verb}_${targetName}`
  const formulations = localeTaskMap[key]?.filter(Boolean) ?? []

  if (!formulations.length) {
    return null
  }

  return {
    formulations,
    key,
    sourceEffect,
    sourceName,
    targetEffect,
    targetName,
  }
}

/**
 * @param {PlacedObject[]} objectPool
 * @param {LocaleTaskMap} localeTaskMap
 * @returns {RelationshipIndex}
 */
export function createRelationshipIndex(objectPool, localeTaskMap) {
  /** @type {Map<string, Set<string>>} */
  const inboundSourcesByTarget = new Map()
  const objectByName = new Map(objectPool.map((objectRecord) => [objectRecord.name, objectRecord]))
  /** @type {Map<string, Set<string>>} */
  const outboundTargetsBySource = new Map()
  /** @type {Map<string, PlayableRelationship>} */
  const playableEdgesByKey = new Map()
  /** @type {Map<string, PlayableRelationship[]>} */
  const playableEdgesBySource = new Map()
  let skippedMissingTargetCount = 0
  /** @type {string[]} */
  const skippedMissingTargetSamples = []

  objectPool.forEach(({ name, record }) => {
    /** @type {Set<string>} */
    const outboundTargets = new Set()
    /** @type {PlayableRelationship[]} */
    const playableEdges = []

    Object.entries(record.relationships ?? {}).forEach(([targetName, relationship]) => {
      if (!objectByName.has(targetName)) {
        skippedMissingTargetCount += 1

        if (skippedMissingTargetSamples.length < 5) {
          skippedMissingTargetSamples.push(`${name} -> ${targetName}`)
        }

        return
      }

      outboundTargets.add(targetName)

      if (!inboundSourcesByTarget.has(targetName)) {
        inboundSourcesByTarget.set(targetName, new Set())
      }

      /** @type {Set<string>} */ (inboundSourcesByTarget.get(targetName)).add(name)

      const playableRelationship = findPlayableRelationship(
        name,
        targetName,
        relationship,
        localeTaskMap,
      )

      if (playableRelationship) {
        playableEdges.push(playableRelationship)
        playableEdgesByKey.set(playableRelationship.key, playableRelationship)
      }
    })

    outboundTargetsBySource.set(name, outboundTargets)

    if (playableEdges.length > 0) {
      playableEdgesBySource.set(name, playableEdges)
    }
  })

  const isolatedNames = objectPool
    .filter(({ name }) => {
      const hasOutboundRelationships = (outboundTargetsBySource.get(name)?.size ?? 0) > 0
      const hasInboundRelationships = (inboundSourcesByTarget.get(name)?.size ?? 0) > 0
      return !hasOutboundRelationships && !hasInboundRelationships
    })
    .map(({ name }) => name)

  if (skippedMissingTargetCount > 0) {
    console.warn('[relationship-index] skipped relationships whose targets are missing from the object pool', {
      count: skippedMissingTargetCount,
      samples: skippedMissingTargetSamples,
    })
  }

  return {
    inboundSourcesByTarget,
    isolatedNames,
    objectByName,
    playableEdgesByKey,
    outboundTargetsBySource,
    playableEdgesBySource,
    playableSourceNames: [...playableEdgesBySource.keys()],
  }
}

/**
 * @param {string} objectName
 * @param {RelationshipIndex} relationshipIndex
 * @param {TaskCandidate} correctTask
 */
function touchesCorrectTaskObjects(objectName, relationshipIndex, correctTask) {
  if (objectName === correctTask.sourceName || objectName === correctTask.targetName) {
    return true
  }

  const inboundSources = relationshipIndex.inboundSourcesByTarget.get(objectName)
  const outboundTargets = relationshipIndex.outboundTargetsBySource.get(objectName)

  return (
    inboundSources?.has(correctTask.sourceName) === true ||
    inboundSources?.has(correctTask.targetName) === true ||
    outboundTargets?.has(correctTask.sourceName) === true ||
    outboundTargets?.has(correctTask.targetName) === true
  )
}

/**
 * @param {string} objectName
 * @param {RelationshipIndex} relationshipIndex
 * @param {TaskCandidate} correctTask
 * @returns {CandidateClass}
 */
function classifyCandidate(objectName, relationshipIndex, correctTask) {
  if (relationshipIndex.isolatedNames.includes(objectName)) {
    return 'isolated'
  }

  if (touchesCorrectTaskObjects(objectName, relationshipIndex, correctTask)) {
    return 'overlap'
  }

  return 'non-overlap'
}

/**
 * @param {RelationshipIndex} relationshipIndex
 */
function chooseRandomTask(relationshipIndex) {
  if (!relationshipIndex.playableSourceNames.length) {
    throw new Error('No locale-playable relationships were found.')
  }

  const sourceName = randomItem(relationshipIndex.playableSourceNames)
  const playableEdges = relationshipIndex.playableEdgesBySource.get(sourceName)

  if (!playableEdges?.length) {
    throw new Error(`No playable relationships were found for source object: ${sourceName}`)
  }

  const edge = randomItem(playableEdges)
  const textIndex = Math.floor(Math.random() * edge.formulations.length)

  return createTaskCandidate(edge, textIndex)
}

/**
 * @param {RelationshipIndex} relationshipIndex
 * @param {SentenceLearningItem} sentenceItem
 * @param {number} reviewedAt
 * @returns {ReviewTaskCandidate | null}
 */
function toReviewTaskCandidate(relationshipIndex, sentenceItem, reviewedAt) {
  if (sentenceItem.seenCount <= 0) {
    return null
  }

  const task = resolveTaskCandidate(relationshipIndex, sentenceItem.taskKey, sentenceItem.textIndex)

  if (!task) {
    return null
  }

  const elapsedHours = Math.max((reviewedAt - sentenceItem.lastReviewedAt) * HOURS_PER_MILLISECOND, 0)
  const predictedRecall = predictRecall(sentenceItem.ebisuModel, elapsedHours, true)

  if (predictedRecall >= REVIEW_RECALL_THRESHOLD) {
    return null
  }

  return {
    predictedRecall,
    task,
  }
}

/**
 * @param {RelationshipIndex} relationshipIndex
 * @param {Map<string, SentenceLearningItem>} sentenceItemsByKey
 * @param {number} [reviewedAt]
 */
function chooseSentenceReviewTask(relationshipIndex, sentenceItemsByKey, reviewedAt = Date.now()) {
  const eligibleTasks = [...sentenceItemsByKey.values()]
    .map((sentenceItem) => toReviewTaskCandidate(relationshipIndex, sentenceItem, reviewedAt))
    .filter((task) => task !== null)

  if (!eligibleTasks.length) {
    return null
  }

  return randomItem(eligibleTasks)
}

/**
 * @param {RelationshipIndex} relationshipIndex
 * @param {Map<string, SentenceLearningItem>} sentenceItemsByKey
 * @returns {TaskSelection}
 */
function selectTask(relationshipIndex, sentenceItemsByKey) {
  if (Math.random() < REVIEW_MODE_PROBABILITY) {
    const reviewTask = chooseSentenceReviewTask(relationshipIndex, sentenceItemsByKey)

    if (reviewTask) {
      return {
        activeTask: reviewTask.task,
        reviewPredictedRecall: reviewTask.predictedRecall,
        selectionMode: 'sentence-review',
      }
    }
  }

  return {
    activeTask: chooseRandomTask(relationshipIndex),
    reviewPredictedRecall: null,
    selectionMode: 'random',
  }
}

/**
 * @param {string} sourceName
 * @param {string} targetName
 * @param {TaskCandidate} correctTask
 */
function isCorrectAction(sourceName, targetName, correctTask) {
  return sourceName === correctTask.sourceName && targetName === correctTask.targetName
}

/**
 * @param {PlacedObject[]} placedObjects
 * @param {TaskCandidate} correctTask
 * @returns {DifficultyBreakdown}
 */
export function calculateBoardDifficulty(placedObjects, correctTask) {
  let missingRelationshipCount = 0
  let overlappingRelationshipCount = 0
  let unrelatedRelationshipCount = 0

  placedObjects.forEach((sourceObject) => {
    placedObjects.forEach((targetObject) => {
      if (sourceObject.name === targetObject.name) {
        return
      }

      if (isCorrectAction(sourceObject.name, targetObject.name, correctTask)) {
        return
      }

      const relationship = sourceObject.record.relationships?.[targetObject.name]

      if (!relationship) {
        missingRelationshipCount += 1
        return
      }

      if (
        sourceObject.name === correctTask.sourceName ||
        sourceObject.name === correctTask.targetName ||
        targetObject.name === correctTask.sourceName ||
        targetObject.name === correctTask.targetName
      ) {
        overlappingRelationshipCount += 1
        return
      }

      unrelatedRelationshipCount += 1
    })
  })

  const missingRelationshipDifficulty = missingRelationshipCount * MISSING_RELATIONSHIP_DIFFICULTY
  const overlappingRelationshipDifficulty =
    overlappingRelationshipCount * OVERLAPPING_RELATIONSHIP_DIFFICULTY
  const unrelatedRelationshipDifficulty =
    unrelatedRelationshipCount * UNRELATED_RELATIONSHIP_DIFFICULTY

  return {
    missingRelationshipCount,
    missingRelationshipDifficulty,
    overlappingRelationshipCount,
    overlappingRelationshipDifficulty,
    total:
      missingRelationshipDifficulty +
      overlappingRelationshipDifficulty +
      unrelatedRelationshipDifficulty,
    unrelatedRelationshipCount,
    unrelatedRelationshipDifficulty,
  }
}

/**
 * @param {TaskCandidate} activeTask
 * @param {Map<string, LearningItem>} learningItemsByObjectName
 * @param {LanguageProgress | null} languageProgress
 * @returns {DifficultyTarget}
 */
function resolveDifficultyRule(activeTask, learningItemsByObjectName, languageProgress) {
  const sourceItem = learningItemsByObjectName.get(activeTask.sourceName)
  const targetItem = learningItemsByObjectName.get(activeTask.targetName)

  if (!sourceItem || !targetItem) {
    return {
      kind: 'ceiling',
      reason: 'One or both task objects are new to the player, so difficulty must stay below 2.',
      value: 2,
    }
  }

  if (!languageProgress) {
    return {
      kind: 'floor',
      reason: 'Both task objects have been seen, but there is no previous round for this language yet, so start from a floor of 0.',
      value: 0,
    }
  }

  if (languageProgress.lastOutcome === 'wrong') {
    return {
      kind: 'ceiling',
      reason: `The previous ${languageProgress.languageCode} round was wrong, so difficulty must stay below the last board difficulty of ${languageProgress.lastBoardDifficulty}.`,
      value: languageProgress.lastBoardDifficulty,
    }
  }

  return {
    kind: 'floor',
    reason: `The previous ${languageProgress.languageCode} round was correct, so difficulty must exceed the last board difficulty of ${languageProgress.lastBoardDifficulty}.`,
    value: languageProgress.lastBoardDifficulty,
  }
}

/**
 * @param {RelationshipIndex} relationshipIndex
 * @param {TaskCandidate} correctTask
 * @param {Set<string>} selectedNames
 */
function collectCandidateNames(relationshipIndex, correctTask, selectedNames) {
  /** @type {Map<CandidateClass, string[]>} */
  const candidateNamesByClass = new Map([
    ['isolated', []],
    ['non-overlap', []],
    ['overlap', []],
  ])

  relationshipIndex.objectByName.forEach((objectRecord, objectName) => {
    if (selectedNames.has(objectName)) {
      return
    }

    const candidateClass = classifyCandidate(objectName, relationshipIndex, correctTask);
    /** @type {string[]} */ (candidateNamesByClass.get(candidateClass)).push(objectRecord.name)
  })

  return candidateNamesByClass
}

/**
 * @param {string} candidateName
 * @param {PlacedObject[]} placedObjects
 * @param {RelationshipIndex} relationshipIndex
 * @param {TaskCandidate} activeTask
 * @returns {CandidateSimulation | null}
 */
function simulateCandidate(candidateName, placedObjects, relationshipIndex, activeTask) {
  const candidate = relationshipIndex.objectByName.get(candidateName)

  if (!candidate) {
    return null
  }

  const nextPlacedObjects = [...placedObjects, candidate]
  const difficultyBreakdown = calculateBoardDifficulty(nextPlacedObjects, activeTask)

  return {
    candidate,
    difficulty: difficultyBreakdown.total,
    difficultyBreakdown,
  }
}

/**
 * @param {CandidateSimulation[]} simulations
 * @param {DifficultyTarget} difficultyRule
 */
function chooseBestSimulation(simulations, difficultyRule) {
  if (!simulations.length) {
    return null
  }

  if (difficultyRule.kind === 'ceiling') {
    const viableSimulations = simulations
      .filter((simulation) => simulation.difficulty < difficultyRule.value)
      .sort((left, right) => right.difficulty - left.difficulty)

    return viableSimulations[0] ?? null
  }

  const aboveFloor = simulations
    .filter((simulation) => simulation.difficulty > difficultyRule.value)
    .sort((left, right) => left.difficulty - right.difficulty)

  if (aboveFloor.length > 0) {
    return aboveFloor[0]
  }

  const belowFloor = simulations.sort((left, right) => right.difficulty - left.difficulty)
  return belowFloor[0] ?? null
}

/**
 * @param {number} difficulty
 * @param {DifficultyTarget} difficultyRule
 */
function hasSatisfiedDifficultyRule(difficulty, difficultyRule) {
  return difficultyRule.kind === 'ceiling'
    ? difficulty < difficultyRule.value
    : difficulty > difficultyRule.value
}

/**
 * @param {RelationshipIndex} relationshipIndex
 * @param {TaskCandidate} activeTask
 * @param {Set<string>} selectedNames
 */
function drawCandidatesForStep(relationshipIndex, activeTask, selectedNames) {
  const candidateNamesByClass = collectCandidateNames(relationshipIndex, activeTask, selectedNames)
  /** @type {string[]} */
  const candidates = [];

  /** @type {CandidateClass[]} */ (['isolated', 'non-overlap', 'overlap']).forEach((candidateClass) => {
    const pool = candidateNamesByClass.get(candidateClass) ?? []

    if (!pool.length) {
      return
    }

    candidates.push(randomItem(pool))
  })

  return candidates
}

/**
 * @param {TaskSelection} selection
 * @param {Map<string, LearningItem>} learningItemsByObjectName
 * @param {LanguageProgress | null} languageProgress
 * @param {RelationshipIndex} relationshipIndex
 * @returns {RoundPlan}
 */
function buildRoundPlan(selection, learningItemsByObjectName, languageProgress, relationshipIndex) {
  const sourceObject = relationshipIndex.objectByName.get(selection.activeTask.sourceName)
  const targetObject = relationshipIndex.objectByName.get(selection.activeTask.targetName)

  if (!sourceObject || !targetObject) {
    throw new Error('The selected task references an object missing from the object pool.')
  }

  const placedObjects = [sourceObject, targetObject]
  const selectedNames = new Set(placedObjects.map(({ name }) => name))
  const difficultyTarget = resolveDifficultyRule(
    selection.activeTask,
    learningItemsByObjectName,
    languageProgress,
  )
  let difficultyBreakdown = calculateBoardDifficulty(placedObjects, selection.activeTask)

  if (difficultyTarget.kind === 'ceiling' && difficultyBreakdown.total >= difficultyTarget.value) {
    return {
      activeTask: selection.activeTask,
      difficulty: difficultyBreakdown.total,
      difficultyBreakdown,
      difficultyTarget,
      placedObjects,
      reviewPredictedRecall: selection.reviewPredictedRecall,
      selectionMode: selection.selectionMode,
    }
  }

  if (difficultyTarget.kind === 'floor' && difficultyBreakdown.total > difficultyTarget.value) {
    return {
      activeTask: selection.activeTask,
      difficulty: difficultyBreakdown.total,
      difficultyBreakdown,
      difficultyTarget,
      placedObjects,
      reviewPredictedRecall: selection.reviewPredictedRecall,
      selectionMode: selection.selectionMode,
    }
  }

  while (placedObjects.length < BOARD_CAPACITY) {
    const candidateNames = drawCandidatesForStep(relationshipIndex, selection.activeTask, selectedNames)

    if (!candidateNames.length) {
      break
    }

    const simulations = shuffled(candidateNames)
      .map((candidateName) =>
        simulateCandidate(candidateName, placedObjects, relationshipIndex, selection.activeTask),
      )
      .filter((simulation) => simulation !== null)
    const chosenSimulation = chooseBestSimulation(simulations, difficultyTarget)

    if (!chosenSimulation) {
      break
    }

    placedObjects.push(chosenSimulation.candidate)
    selectedNames.add(chosenSimulation.candidate.name)
    difficultyBreakdown = chosenSimulation.difficultyBreakdown

    if (difficultyTarget.kind === 'ceiling') {
      continue
    }

    if (hasSatisfiedDifficultyRule(difficultyBreakdown.total, difficultyTarget)) {
      break
    }
  }

  return {
    activeTask: selection.activeTask,
    difficulty: difficultyBreakdown.total,
    difficultyBreakdown,
    difficultyTarget,
    placedObjects,
    reviewPredictedRecall: selection.reviewPredictedRecall,
    selectionMode: selection.selectionMode,
  }
}

/**
 * @param {PlanRoundOptions} options
 * @returns {RoundPlan}
 */
export function planRound({ languageProgress, learningItemsByObjectName, relationshipIndex, sentenceItemsByKey }) {
  const selection = selectTask(relationshipIndex, sentenceItemsByKey)

  return buildRoundPlan(selection, learningItemsByObjectName, languageProgress, relationshipIndex)
}

/**
 * @param {ObjectRecord} record
 */
export function objectHasRelationships(record) {
  return Object.keys(record.relationships ?? {}).length > 0
}
