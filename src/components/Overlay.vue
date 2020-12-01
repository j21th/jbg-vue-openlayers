<template>
  <v-overlay
    v-if="getLoading"
    :absolute="false"
    :opacity="0.7"
    :z-index="99999">
    <v-progress-circular
      :indeterminate="true"
      :rotate="200"
      :size="150"
      :width="8"
      color="primary" />
  </v-overlay>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: "Overlay",
  computed: {
    ...mapGetters(["getLoading"])
  }
}
</script>


