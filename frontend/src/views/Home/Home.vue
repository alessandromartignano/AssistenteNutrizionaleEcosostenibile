<template>
  <div class="homepage bg-img">
    <div class="page">
      <Homepage style="opacity:1 !important"/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Homepage from '../../components/Homepage/Homepage.vue';

export default {
  name: 'home',
  components: {
    Homepage,
  },
};
</script>

<style lang="sass">
  @import './home.sass'
</style>
