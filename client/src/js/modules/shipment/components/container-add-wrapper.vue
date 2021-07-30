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

        <component v-else :is="componentView" :dewarModel="model"
        />
    </section>
</template>

<script>
/*
* Abstract the logic to determine what view to render here
* Router guard determines if we can still add content to the proposal
* Then displays the addcontainer view specific to a proposal type
*/
import EventBus from 'app/components/utils/event-bus.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import SaxsContainerAdd from 'modules/types/saxs/shipment/views/container-add.vue'

import { ContainerAddMap } from 'modules/shipment/components/container-map'
import Dewar from 'models/dewar'

import store from 'app/store/store'
import { mapState } from 'vuex'

export default {
    name: 'container-add-wrapper',
    components: {
        'marionette-view': MarionetteView,
        'saxs-container-add': SaxsContainerAdd,
    },
    props: {
        'did': Number,
        'visit': String,
    },
    data: function() {
        return {
            showMarionetteView: false,
            mview: null,
            model: null,
            bc : [],
            componentView: '',
            // At some point we may replace the original shipment marionette view in which case this can be removed
            // If we have no valid marionette view, pick from this proposaltype list
            views: {
                'saxs': 'saxs-container-add'
            }
        }
    },
    watch: {
        // If not using a marionette view, signal to update breadcrumbs
        componentView: function() {
            EventBus.$emit('bcChange', this.bc)
        }
    },
    computed: {
        options: function() {
            return {
                dewar: this.model, // Note model mapped to dewar for view
                visit: this.visit
            }
        },
        ...mapState('proposal', { 'proposalType': 'proposalType' })
    },
    created: function() {
        this.bc = [{ title: 'Shipments', url: '/shipments' }]

        this.model = new Dewar({ DEWARID: this.did })

        this.getDewar().then( (val) => {
            this.mview = ContainerAddMap[this.proposalType] ? ContainerAddMap[this.proposalType].view : ContainerAddMap['default'].view

            this.setBreadcrumbs()            
        }, (error) => {
            console.log("Error getting dewar model " + error.msg)
            app.alert({ title: 'No such dewar', message: error.msg})
        }).finally( () => {
            if (this.mview) this.showMarionetteView = true
            else this.componentView = this.views[this.proposalType]
        })
    },
    methods: {
        // We get the model here because the view we render depends on the container details
        getDewar: function() {
            // Wrap the backbone request into a promise so we can wait for the result
            return new Promise((resolve) => {
                this.model.fetch({
                    success: function() {
                        resolve(true)
                    },
                    // Original controller had no error condition...
                    error: function() {
                        reject({msg: 'The specified dewar could not be found'})
                    },
                })

            })
        },
        setBreadcrumbs: function() {
            // Update the breadcrumbs
            this.bc.push({ title: this.model.get('SHIPPINGNAME'), url: '/shipments/sid/'+this.model.get('SHIPPINGID') })
            this.bc.push({ title: 'Containers' })
            this.bc.push({ title: 'Add Container'})
        }
    },
    beforeRouteEnter: (to, from, next) => {
      // Lookup the proposal first to make sure we can still add to it
      store.dispatch('proposal/proposalLookup', { field: 'DEWARID', value: to.params.did })
      .then((response) => {
        console.log("Proposal lookup response: " + JSON.stringify(response))
          // Make sure we can still add items to this proposal
          if (app.proposal && app.proposal.get('ACTIVE') != 1) {
            store.commit('notifications/addNotification', { title: 'Proposal Not Active', message: 'This proposal is not active so new containers cannot be added'} )
            next('/403?url='+to.fullPath)
          } else {
            next()
          }
      }, (error) => {
          console.log("Error " + error.msg)
          store.commit('notifications/addNotification', {title: 'No such container', msg: error.msg, level: 'error'})
          next('/404')
      })
    }

}
</script>