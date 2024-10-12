import { SubjectsState } from './../../store/app-state.service';
import { Injectable } from '@angular/core';
import { CourseTimeInStringState, StudentsState } from 'src/store/app-state.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private courseTimeState: CourseTimeInStringState,
    private studentsState: StudentsState,
    private subjectsState: SubjectsState
  ) { }

  public resetAllStates() {
    this.courseTimeState.resetState();
    this.subjectsState.resetState();
    this.studentsState.resetState();
  }
}
