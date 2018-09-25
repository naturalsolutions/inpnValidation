import { AbstractControl } from '@angular/forms';

export class FormValidator {

    static especeValidator(control: AbstractControl) {
        if (typeof control.value == "object") {
            if (control.value.cd_ref == 0)
                return { especeValidError: true };
            else
                return null
        }
        else
            return { especeValidError: true };
    }

    static supraValidator(control: AbstractControl) {
        if (typeof control.value == "object") {
            if (control.value.cdRef == 0)
                return { supraValidError: true };
            else
                return null
        }
        else
            return { supraValidError: true };
    }
}

