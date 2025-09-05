<template>
    <div class="card">
        <div class="card-body">
            <div class="card-title text-center">
                {{ props.prompt }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    prompt: { type: String }
})

</script>