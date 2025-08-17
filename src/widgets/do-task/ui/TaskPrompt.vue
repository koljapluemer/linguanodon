<template>
    <div class="big-card">
        <div class="card-body items-center text-center">
            <div class="card-title">
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