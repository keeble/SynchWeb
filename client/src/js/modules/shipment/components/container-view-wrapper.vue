<template>
    <section>
        <marionette-view
            v-if="showMarionetteView"
            :key="$route.fullPath"
            :options="options"
            :preloaded="true"
            :mview="mview"
            :breadcrumbs="bc">
        </marionette-view>

        <component v-else :is="componentView" :containerModel="model"/>
    </section>
</template>

<script>
/*
* Abstract the logic to determine what view to render here
* This handles plates as well as pucks and deals with xpdf type plates as well
*/
import EventBus from 'app/components/utils/event-bus.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import { ContainerViewMap, ContainerPlateViewMap } from 'modules/shipment/components/container-map'
import Container from 'models/container'
import SaxsContainerView from 'modules/types/saxs/shipment/views/container-view.vue'

import store from 'app/store/store'

export default {
    name: 'container-view-wrapper',
    components: {
        'marionette-view': MarionetteView,
        'saxs-container-view': SaxsContainerView
    },
    props: {
        'cid': Number,
        'iid': Number,
        'sid': Number
    },
    data: function() {
        return {
            showMarionetteView: false,
            componentView: '',
            mview: null,
            model: null,
            collection: null,
            params: null,
            queryParams: null,
            bc : [],
            // Store array of container views based on proposal type
            // At some point we may replace the original marionette view in which case this can be removed
            views: {
                'saxs': 'saxs-container-view'
            }
        }
    },
    watch: {
        // If not using a marionette view, signal to update breadcrumbs
        componentView: function(newVal) {
            EventBus.$emit('bcChange', this.bc)
        }
    },
    computed: {
        options: function() {
            return {
                collection: this.collection,
                model: this.model,
                params: this.params,
                queryParams: this.queryParams
            }
        },
        proposalType : function() {
            return this.$store.state.proposal.proposalType
        }
    },
    created: function() {
        // Determine the marionette view constructor we need based on the type
        // The title is based on the proposal type
        let title = ContainerViewMap[this.proposalType] ? ContainerViewMap[this.proposalType].title : 'Container'

        this.bc = [{ title: 'Shipments', url: '/shipments' }]

        // We need to know what the container type is before rendering
        this.model = new Container({ CONTAINERID: this.cid })

        this.getContainer().then( (isPlate) => {
            if (isPlate) {
                this.mview = ContainerPlateViewMap[this.proposalType] ? ContainerPlateViewMap[this.proposalType].view : null
                this.params = { iid: this.iid, sid: this.sid }
            } else {
                this.mview = ContainerViewMap[this.proposalType] ? ContainerViewMap[this.proposalType].view : ContainerViewMap['default'].view
            }
            this.setBreadcrumbs()
        }, (error) => {
            console.log("Error getting container model " + error.msg)
            app.alert({ title: 'No such container', message: error.msg})
        }).finally( () => {
          // Only render marionette view if we have one
          if (this.mview != null) this.showMarionetteView = true
          else this.componentView = this.views[this.proposalType]
        })
    },
    methods: {
        // We get the model here because the view we render depends on the container details
        getContainer: function() {
            let self = this

            // Wrap the backbone request into a promise so we can wait for the result
            return new Promise((resolve) => {
                this.model.fetch({
                    success: function(model) {
                        console.log("Container View got model " + JSON.stringify(model))
                        let isPlate = self.isPlate(model)

                        resolve(isPlate)
                    },
                    // Original controller had no error condition...
                    error: function() {
                        reject({msg: 'The specified container could not be found'})
                    },
                })

            })
        },
        // Determine if the container is a plate type
        isPlate: function(model) {
            let containerType = model.get('CONTAINERTYPE')

            // This is the current logic to determine the plate type
            // Anything other than Box, Puck or PCRStrip
            // TODO - get container types from data base
            let is_plate = !(['Box', 'Puck', 'PCRStrip', null].indexOf(containerType) > -1)

            // Also disclude anything with an Xpdf prefix...
            if (is_plate && model.get('CONTAINERTYPE').includes('Xpdf')) is_plate = false

            console.log('is plate', is_plate)

            return is_plate
        },
        setBreadcrumbs: function() {
            // Update the breadcrumbs
            this.bc.push({ title: this.model.get('SHIPMENT'), url: '/shipments/sid/'+this.model.get('SHIPPINGID') })
            this.bc.push({ title: 'Containers' })
            this.bc.push({ title: this.model.get('NAME') })
        }
    },
    beforeRouteEnter: function(to, from, next) {
      // Lookup the proposal first to make sure we can still add to it
      store.dispatch('proposal/proposalLookup', { field: 'CONTAINERID', value: to.params.cid })
      .then(() => {
          console.log("Proposal Lookup OK - type = " + store.state.proposalType)
          next()
      }, (error) => {
          store.commit('notifications/addNotification', {title: 'No such container', msg: error.msg, level: 'error'})
          next('/404')
      })
    }
}
</script>