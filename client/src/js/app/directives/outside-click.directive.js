
let handleOutsideClick

export default {
  directives: {
    closable: {
      bind(el, binding, vnode) {
        handleOutsideClick = (e) => {
          e.stopPropagation()

          const { handler, excludeElements } = binding.value

          let clickedOnExcludedElement = false
          excludeElements.forEach((refName) => {
            if (!clickedOnExcludedElement) {
              let excludedElement
              if (typeof refName === 'string') {
                excludedElement = vnode.context.$refs[refName]
              } else if (Array.isArray(refName)) {
                excludedElement = vnode.context.$refs[refName[0]] && vnode.context.$refs[refName[0]][refName[1]]
              }

              if (excludedElement && excludedElement.$el) { excludedElement = excludedElement.$el }

              // If adding a ref to a v-for element, the ref value is returned as an array with one element. So we are checking for that as well
              // so that we can successfully check if the ref has been clicked or not
              if (typeof excludedElement !== 'undefined' && Array.isArray(excludedElement)) {
                clickedOnExcludedElement = excludedElement[0] && excludedElement[0].contains(e.target)
              } else if (typeof excludedElement !== 'undefined' && !Array.isArray(excludedElement)) {
                clickedOnExcludedElement = excludedElement.contains(e.target)
              }
            }
          })

          const searchInputElement = e.target.classList.contains(vnode.context.searchInputClassName)

          if (!el.contains(e.target) && !clickedOnExcludedElement && !searchInputElement) {
            vnode.context[handler]()
          }
        }

        document.addEventListener('click', handleOutsideClick)
        document.addEventListener('touchstart', handleOutsideClick)
      },
      unbind() {
        document.removeEventListener('click', handleOutsideClick)
        document.removeEventListener('touchstart', handleOutsideClick)
      },
    },
  },
}