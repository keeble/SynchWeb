define(['vue',
    'veevalidate',
    'promise',
    'utils/vuewrapper',
    'modules/notebook/views/vue-notebookHandler.vue',
    ], function(Vue, VeeValidate, Promise, VueWrapper, NotebookHandler) {

    return VueWrapper.extend({
        vueView: Vue.extend({
            template: '<section class="content"><h1>Notebook</h1><p class="help">Please note you need to have a visit/session selected to view and edit notebooks</p><notebookhandler></notebookhandler></section>',
            components: {
                'notebookhandler': NotebookHandler.default
            },
        })
    })
})
