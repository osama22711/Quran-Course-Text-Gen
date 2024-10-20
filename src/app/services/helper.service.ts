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

  convertNumber(number: string, direction: 'toEnglish' | 'toArabic'): string {
    const arabicToEnglishMap: { [key: string]: string } = {
      '٠': '0',
      '١': '1',
      '٢': '2',
      '٣': '3',
      '٤': '4',
      '٥': '5',
      '٦': '6',
      '٧': '7',
      '٨': '8',
      '٩': '9'
    };

    const englishToArabicMap: { [key: string]: string } = {
      '0': '٠',
      '1': '١',
      '2': '٢',
      '3': '٣',
      '4': '٤',
      '5': '٥',
      '6': '٦',
      '7': '٧',
      '8': '٨',
      '9': '٩'
    };

    if (direction === 'toEnglish') {
      return number.split('').map(char => arabicToEnglishMap[char] || char).join('');
    } else if (direction === 'toArabic') {
      return number.split('').map(char => englishToArabicMap[char] || char).join('');
    } else {
      throw new Error('Invalid direction. Use "toEnglish" or "toArabic".');
    }
  }
}
