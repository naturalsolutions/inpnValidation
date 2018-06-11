import { AbstractControl } from '@angular/forms';

export class FormValidator {
    static especeValidator(control: AbstractControl) {
        if (control.value.cd_ref == 0)
            return {especeValid : false};
        else
            return null
    }


}

