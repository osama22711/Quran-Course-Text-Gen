import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-note-popover',
  templateUrl: './note-popover.component.html',
  styleUrls: ['./note-popover.component.scss'],
})
export class NotePopoverComponent implements OnInit {
  @Input() isWord!: boolean;
  @Input() noteIdentifier!: string;
  @Input() noteHeader!: string;
  public quranicNoteForm!: FormGroup;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initializeForm();
    console.log(this.isWord);
    console.log(this.noteIdentifier);
    console.log(this.noteHeader);
  }

  private initializeForm() {
    this.quranicNoteForm = this.formBuilder.group({
      note: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }
}
