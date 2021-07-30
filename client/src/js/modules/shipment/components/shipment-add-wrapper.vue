<template>
  <div class="content">
    <marionette-view
      v-if="showMarionetteView"
      :key="$route.fullPath"
      :options="options"
      :fetchOnLoad="true"
      :mview="mview"
      :breadcrumbs="breadcrumbs">
    </marionette-view>

    <component v-else :is="componentView"/>
  </div>
</template>

<script>
import EventBus from 'app/components/utils/event-bus.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import SaxsShipmentAdd from 'modules/types/saxs/shipment/views/shipment-add.vue'
import ShipmentAddView from 'modules/shipment/views/shipmentadd'

export default {
  name: "shipment-add-wrapper",
  props: {
    'breadcrumbs': Array,
    'options': Object
  },
  components: {
    'marionette-view': MarionetteView,
    'saxs-shipment': SaxsShipmentAdd
  },
  data() {
    return {
        showMarionetteView: false,
        componentView: '',
        mview: ShipmentAddView,
        // Store array of shipment views based on proposal type
        // At some point we may replace the original shipment marionette view in which case this can be removed
        views: {
          'saxs': 'saxs-shipment'
        }
    }
  },
  computed: {
    proposalType: function() {
      return this.$store.state.proposal.proposalType
    },
    scmView: function() {
      return this.proposalType == 'saxs' ? true : false
    }
  },
  created: function() {
    this.setShipmentView()
  },
  methods: {
    setShipmentView: function() {
      // Determine if there is a new vue style component for this proposal type.
      // If not we will show the original Marionette View page
      this.componentView = this.views[this.proposalType] || null

      if (this.componentView) EventBus.$emit('bcChange', this.bc)
      else {
        this.mview = ShipmentAddView
        this.showMarionetteView = true
      }
    }
  }
}
</script>