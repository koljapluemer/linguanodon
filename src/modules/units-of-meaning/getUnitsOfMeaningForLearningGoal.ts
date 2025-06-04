const API_URL = import.meta.env.VITE_API_URL

export async function getUnitsOfMeaningForLearningGoal(
  learningGoalId: number,
  page: number = 1,
  pageSize: number = 10
) {
  if (pageSize > 100) {
    throw new Error('Page size cannot exceed 100');
  }

  const response = await fetch(
    `${API_URL}/list_units_of_meaning_for_learning_goal/${learningGoalId}/?page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}
