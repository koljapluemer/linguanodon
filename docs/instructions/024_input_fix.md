Please go through the codebase (/src) and search for usage of the `<input` tag or forms in general.
Standardize usage to the following scheme:

```
<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
  <legend class="fieldset-legend">Page details</legend>

  <label class="label">Title</label>
  <input type="text" class="input" placeholder="My awesome page" />

  <label class="label">Slug</label>
  <input type="text" class="input" placeholder="my-awesome-page" />

  <label class="label">Author</label>
  <input type="text" class="input" placeholder="Name" />
</fieldset>
```

Do also follow accessibility guidelines, using `for`.
Avoid using headings or text in forms outside this scheme.

For horizontal forms (those that fit into a single row), use a similar scheme but keep the per-row logic.
Labels should ALWAYS!!!! be above, not left of, their input. You may need to use additional wrapper elements to achieve this.

Do not excessively spam cards or other fancy elements.