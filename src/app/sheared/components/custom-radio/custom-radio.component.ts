import { NgFor, NgIf } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { Icon } from '../../utils';
import { FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-custom-radio',
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './custom-radio.component.html',
  styleUrl: './custom-radio.component.css'
})

export class CustomRadioComponent {
    options = input.required<Icon[] | undefined>()
    userSelect = model.required<FormArray<FormControl<string | null>>>()

    ngOnInit(): void {
      // Clear existing controls
      // while (this.userSelect().length !== 0) {
      //   this.userSelect().removeAt(0);
      // }
  
      // Add a form control for each option
      this.options()?.forEach(() => {
        this.userSelect().push(
            new FormControl<string | null>(null, Validators.required)
        );
      });
    }

    onSelectionChange(optionId: string, index: number) {
      const currentValue = this.userSelect().at(index).value;
      if (currentValue === optionId) {
        // Deselect if already selected
        this.userSelect().at(index).setValue(null);
      } else {
        // Select the option
        this.userSelect().at(index).setValue(optionId);
      }
    }


    trackByFn(index: number, item: Icon): string {
      return item.id; // or another unique property of `item`
    }
    
} 
