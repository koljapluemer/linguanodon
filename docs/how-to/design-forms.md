# Form Design Guidelines

This document explains how to create consistent forms using our standardized form components.

## Components

### `FormFieldset.vue` - Section Wrapper
Groups related form fields with proper semantic structure.

```vue
<FormFieldset legend="Section Name" size="md" layout="vertical">
  <!-- form fields go here -->
</FormFieldset>
```

**Props:**
- `legend?: string` - Section title (appears as legend element)
- `size?: 'sm' | 'md' | 'lg'` - Fieldset width
- `layout?: 'vertical' | 'horizontal'` - Field arrangement

### `FormField.vue` - Label + Input Wrapper
Provides proper accessibility and consistent styling for individual fields.

```vue
<FormField label="Field Name" required size="md">
  <template #default="{ inputId, inputClasses }">
    <input
      :id="inputId"
      v-model="value"
      :class="inputClasses"
      type="text"
      placeholder="Enter value"
    />
  </template>
</FormField>
```

**Props:**
- `label: string` - Field label (required)
- `required?: boolean` - Adds * to label
- `size?: 'sm' | 'md' | 'lg'` - Input size variant
- `fullWidth?: boolean` - Makes field take full available width

**Template Slot:**
- `inputId: string` - Unique ID for accessibility
- `inputClasses: string[]` - Computed CSS classes array
- `inputClassString: string` - Flattened CSS classes string

## Usage Examples

### Basic Vertical Form
```vue
<template>
  <FormFieldset legend="User Details">
    <FormField label="Name" required>
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="form.name"
          :class="inputClasses"
          type="text"
          placeholder="Your name"
        />
      </template>
    </FormField>

    <FormField label="Email" required>
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="form.email"
          :class="inputClasses"
          type="email"
          placeholder="your@email.com"
        />
      </template>
    </FormField>
  </FormFieldset>
</template>
```

### Horizontal Layout
```vue
<FormFieldset layout="horizontal">
  <FormField label="First Name" size="sm" fullWidth>
    <template #default="{ inputId, inputClasses }">
      <input :id="inputId" v-model="first" :class="inputClasses" type="text" />
    </template>
  </FormField>
  
  <FormField label="Last Name" size="sm" fullWidth>
    <template #default="{ inputId, inputClasses }">
      <input :id="inputId" v-model="last" :class="inputClasses" type="text" />
    </template>
  </FormField>
</FormFieldset>
```

### With Custom Components
```vue
<FormField label="Language" required>
  <template #default="{ inputId }">
    <LanguageDropdown
      :id="inputId"
      v-model="form.language"
      placeholder="Select language"
    />
  </template>
</FormField>
```

### Large Input Variant
```vue
<FormField label="Title" size="lg" required>
  <template #default="{ inputId, inputClasses }">
    <input
      :id="inputId"
      v-model="form.title"
      :class="inputClasses"
      type="text"
      placeholder="Enter title"
    />
  </template>
</FormField>
```

### Textarea Example
```vue
<FormField label="Description">
  <template #default="{ inputId }">
    <textarea
      :id="inputId"
      v-model="form.description"
      class="textarea textarea-bordered w-full"
      rows="4"
      placeholder="Enter description"
    ></textarea>
  </template>
</FormField>
```

## Requirements

1. **Always use FormFieldset** - Wrap related fields in fieldsets with legends
2. **Labels above inputs** - Never place labels to the left of inputs
3. **Use accessibility attributes** - Always bind `inputId` to input elements
4. **Avoid excessive styling** - Don't wrap fieldsets in additional cards/containers
5. **Import required components** - Add FormFieldset and FormField imports

## Styling Components with @apply

If you need to add scoped styles that use Tailwind @apply, add the @reference directive:

```vue
<style scoped>
@reference "tailwindcss";

.custom-field {
  @apply space-y-2 font-semibold;
}
</style>
```

## Migration from Old Forms

**Replace this:**
```vue
<div class="card bg-base-100 shadow-lg">
  <div class="card-body">
    <h3 class="card-title">Basic Information</h3>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Name *</span>
      </label>
      <input class="input input-bordered" v-model="name" />
    </div>
  </div>
</div>
```

**With this:**
```vue
<FormFieldset legend="Basic Information">
  <FormField label="Name" required>
    <template #default="{ inputId, inputClasses }">
      <input :id="inputId" :class="inputClasses" v-model="name" />
    </template>
  </FormField>
</FormFieldset>
```