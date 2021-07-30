// This mixin contains utility function to determine vee-validate rules from a backbone model
// Backbone models may have a validation property e.g.:
//    validation: {
//       SHIPPINGNAME: {
//         required: true,
//         pattern: 'wwsdash',
//       }, ....
// This mixin provides a function to convert the validation rule into a vee-validate compatible definition
// e.g.: { required: true, regex: /^(\w|\s|\-)+$/, max: 45 }
// Returns '' if no valid model or property, or if no matching rule found
import ValidationRules from 'utils/validation_rules.js'

export const ValidationModelMixin = {
  methods: {
    getValidationRule: function (model, property) {
			if (!model || !property) return ''

      // Does the model have a validation property?
      if (!model.validation[property]) return ''

      let pattern = model.validation[property].pattern
      let required = model.validation[property].required ? model.validation[property].required : false
      let maxLength = model.validation[property].maxLength ? model.validation[property].maxLength : null

      // Does the pattern match a regular expression we have already defined?
      if (!ValidationRules[pattern]) return ''

      let rule = {}
      rule.required = required
      rule.regex = ValidationRules[pattern].regex
      if (maxLength) rule.max = maxLength

      return rule
    },
  },
}