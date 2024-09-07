import { Component, OnInit } from '@angular/core';
import { CourseTimeInStringState, Student, StudentsState, SubjectsState } from 'src/store/app-state.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  students: string[] = [];
  subjects: string[] = [];
  courseTimeInputValue: string = this.courseTimeState.getValue();
  studentInputValue: string = '';
  subjectInputValue: string = '';
  studentsData: Student[] | null = null;

  constructor(private courseTimeState: CourseTimeInStringState, private studentsState: StudentsState, private subjectsState: SubjectsState) { }

  ngOnInit(): void {
    this.studentsState.getState().subscribe(studentsData => {
      this.studentsData = studentsData;
    });

    this.studentsState.getState().subscribe((studentState) => {
      if (studentState) {
        this.students = studentState!.map(x => x.name);;
      }
    });

    this.subjectsState.getState().subscribe((subjectStateValue) => {
      if (subjectStateValue) {
        this.subjects = subjectStateValue;
      }
    });
  }

  addStudent() {
    if (!this.studentInputValue.trim()) return;

    const previousState = this.studentsState.getValue();
    const isStudentExist = previousState ? previousState?.filter(x => x.name.includes(this.studentInputValue)).length > 0 : false;

    if (!isStudentExist) {
      this.students.push(this.studentInputValue);
      this.saveStudentToState(this.studentInputValue);
      this.studentInputValue = '';
    }
  }

  addSubject() {
    if (!this.subjectInputValue.trim()) return;

    const previousState = this.subjectsState.getValue();
    const isSubjectExist = previousState !== null ? previousState?.filter(x => x.includes(this.subjectInputValue)).length > 0 : false;

    if (!isSubjectExist) {
      this.subjects.push(this.subjectInputValue);
      this.saveSubjectToState(this.subjectInputValue);
      this.subjectInputValue = '';
    }
  }

  saveSubjectToState(subjectName: string) {
    const previousSubjects = this.subjectsState.getValue() ? this.subjectsState.getValue() : new Array<string>();

    previousSubjects?.push(subjectName);

    this.subjectsState.setState(previousSubjects);
  }

  saveStudentToState(studentName: string) {
    const student: Student = {
      name: studentName,
      attendance: [],
      memorization: []
    }

    const previousStudents = this.studentsState.getValue() ? this.studentsState.getValue() : new Array<Student>();

    previousStudents?.push(student);

    this.studentsState.setState(previousStudents);
  }

  onCourseTimeInput(event: any) {
    const value = event.target!.value;

    this.courseTimeState.setState(value);
  }

  exportStudentsDataToExcel() {
    if (!this.studentsData) return;

    let topMemorizer = null;
    let topAttendence = null;

    const dates: string[] = [];
    let topMemorizerCount = 0;
    let topAttendenceCount = 0;
    this.studentsData.forEach(person => {
      person.attendance.forEach(record => {
        if (!dates.includes(record.date)) {
          dates.push(record.date)
        }
      });

      const memorizeCount = person.memorization.reduce((count, record) => {
        if (record.hasParticipated) {
          return count + 1;
        }
        return count;
      }, 0);

      if (memorizeCount > topMemorizerCount) {
        topMemorizerCount = memorizeCount;
        topMemorizer = person.name;
      }

      const attendanceCount = person.attendance.reduce((count, record) => {
        if (record.hasParticipated) {
          return count + 1;
        }
        return count;
      }, 0);

      if (attendanceCount > topAttendenceCount) {
        topAttendenceCount = attendanceCount;
        topAttendence = person.name;
      }
    });

    const sortedDates = dates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());

    const sheetData: any[][] = [];

    const header = ['الأسم'];
    sortedDates.forEach(date => {
      header.push(date);
      header.push('');
    });
    sheetData.push(header);

    const subheader = [''];
    sortedDates.forEach(() => {
      subheader.push('الحضور');
      subheader.push('التسميع');
    })
    sheetData.push(subheader);

    this.studentsData.forEach(person => {
      const row = [person.name];

      sortedDates.forEach(date => {
        const attendanceRecord = person.attendance.find(record => record.date === date);
        const attendance = attendanceRecord ? `${attendanceRecord.hasParticipated ? 'نعم' : 'لا'}` : 'لا';

        const memorizationRecord = person.memorization.find(record => record.date === date);
        const memorization = memorizationRecord ? `${memorizationRecord.hasParticipated ? 'نعم' : 'لا'}` : 'لا';

        row.push(attendance);
        row.push(memorization);
      });

      sheetData.push(row);
    });

    sheetData.push([]);

    const courseDays = ['ايام الدورة'];
    courseDays.push(`${dates.length}`);
    sheetData.push(courseDays);

    const topMemorizerRow = ['اكثر تسميع'];
    topMemorizerRow.push(topMemorizer ? `${topMemorizer} سمع اكثر من ${topMemorizerCount}` : 'لا يوجد احد');
    sheetData.push(topMemorizerRow);

    const topAttendenceRow = ['اكثر حضور'];
    topAttendenceRow.push(topAttendence ? `${topAttendence} حضر اكثر من ${topAttendenceCount}` : 'لا يوجد احد');
    sheetData.push(topAttendenceRow);

    const serialMemorizationRow = ['تسميع متتالي'];
    const consecutiveMemorizer = this.getTopConsecutiveMemorizer(sortedDates);
    serialMemorizationRow.push(`${consecutiveMemorizer?.name} سمع اكثر من ${consecutiveMemorizer.streak}`);
    sheetData.push(serialMemorizationRow);

    const serialAttendanceRow = ['حضور متتالي'];
    const consecutiveAttendence = this.getTopConsecutiveAttendence(sortedDates);
    serialAttendanceRow.push(`${consecutiveMemorizer?.name} حضر اكثر من ${consecutiveMemorizer.streak}`);
    sheetData.push(serialAttendanceRow);


    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance and Memorization');

    const filePath = 'output.xlsx';
    XLSX.writeFile(workbook, filePath);

    console.log(`Excel file has been created at ${filePath}`);
  }

  private getTopConsecutiveMemorizer(courseDays: string[]): any {
    if (!this.studentsData) return null;

    let topMemorizer = null;
    let topMemorizerStreak = 0;

    this.studentsData.forEach(student => {
      let currentStreak = 0;

      for (let i = 0; i < courseDays.length; i++) {
        const participationDate = student.memorization.filter(x => x.date === courseDays[i]);
        if (participationDate.length > 0 && participationDate[0].hasParticipated) {
          currentStreak++;
          if (currentStreak > topMemorizerStreak) {
            topMemorizer = student.name;
            topMemorizerStreak = currentStreak;
          }
        }
      }
    });

    const returnedData = {
      name: topMemorizer,
      streak: topMemorizerStreak
    }
    return returnedData;
  }

  private getTopConsecutiveAttendence(courseDays: string[]): any {
    if (!this.studentsData) return null;

    let topAttendence = null;
    let topAttendenceStreak = 0;

    this.studentsData.forEach(student => {
      let currentStreak = 0;

      for (let i = 0; i < courseDays.length; i++) {
        const participationDate = student.attendance.filter(x => x.date === courseDays[i]);
        if (participationDate.length > 0 && participationDate[0].hasParticipated) {
          currentStreak++;
          if (currentStreak > topAttendenceStreak) {
            topAttendence = student.name;
            topAttendenceStreak = currentStreak;
          }
        }
      }
    });

    const returnedData = {
      name: topAttendence,
      streak: topAttendenceStreak
    }
    return returnedData;
  }
}
