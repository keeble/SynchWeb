// This extends the backbone model validation rules by using a common definition
// This allows vue elements to use the same validation rules without necessarily needing to use backbone
// New rules should be defined in validation_rules and mapped here
define(['backbone', 'utils/validation_rules', 'backbone-validation'], function (Backbone, ValidationRules) {

    _.extend(Backbone.Validation.patterns, {
        wwsdash: ValidationRules.wwsdash.regex,
        wwsldash: ValidationRules.wwsldash.regex,
        wwsbdash: ValidationRules.wwsbdash.regex,
        wwdash: ValidationRules.wwdash.regex,
        datetime: ValidationRules.datetime.regex,
        edate: ValidationRules.edate.regex,
        word: ValidationRules.word.regex,
        fcode: ValidationRules.fcode.regex,
        time: ValidationRules.time.regex,
        sequence: ValidationRules.sequence.regex,
        address: ValidationRules.address.regex,
        array: ValidationRules.array.regex,
        country: ValidationRules.country.regex,
        visit: ValidationRules.visit.regex,
        twopath: ValidationRules.twopath.regex,
    })

    _.extend(Backbone.Validation.messages, {
        required: 'This field is required',
        wwsdash: ValidationRules.wwsdash.message,
        wwsldash: ValidationRules.wwsldash.message,
        wwsbdash: ValidationRules.wwsbdash.message,
        wwdash: ValidationRules.wwdash.message,
        datetime: ValidationRules.datetime.message,
        edate: ValidationRules.edate.message,
        word: ValidationRules.word.message,
        fcode: ValidationRules.fcode.message,
        time: ValidationRules.time.message,
        sequence: ValidationRules.sequence.message,
        address: ValidationRules.address.message,
        array: ValidationRules.array.message,
        country: ValidationRules.country.message,
        visit: ValidationRules.visit.message,
        twopath: ValidationRules.twopath.message,
    })

})
