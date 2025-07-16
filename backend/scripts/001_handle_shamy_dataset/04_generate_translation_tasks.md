# Generate Translation Tasks

- Load our Levanti dataset and find sentences that are 3-6 words long (in the Arabic)
- Put a const at top of script determining how many sentences we want. Pick randomly from the applicable sentence according to number
    - use [this script](03_generate_set_data.py) to see how that's done
- Use OpenAI for *each sentence* to extract vocabulary from the sentence. 
    - Pretty much adopt the approach from [this script](../002_handle_yt_video/generate.py)
    - Adapt the prompt, hardcode in Levantine Arabic
    - But same goal: Splitting up the sentence into useful vocab
    - However, we pass the AI *both* the Arabic sentence and the English sentence from the dataset, so it has to do very little actual translation work (just figure out which translation belongs to which)
- Then, generate `Set` data, which should be formatted similar to [this JSON](../../data/italian_expressions.json)
    - Our task should be "Translate the sentence '$sentence_content_in_arabic'"
    - primary units should be our list of extracted vocab, IN THE CORrECt FORMAT, like in [this JSON](../../data/italian_expressions.json) — with mutually linked translation and language codes and everything.
    - The whole sentence itself is NOT featured in the output data — after all, that's the task for the user.