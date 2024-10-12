import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CourseTimeInStringState, Student, StudentsState, SubjectsState } from 'src/store/app-state.service';
import { ActionSheetButton, AlertController } from '@ionic/angular';
import { ExcelExporterService } from '../services/excel-exporter.service';
import { HelperService } from '../services/helper.service';
import { fromEvent, tap, throttleTime } from 'rxjs';

@Component({
  selector: 'app-settings-tab',
  templateUrl: 'settings-tab.page.html',
  styleUrls: ['settings-tab.page.scss']
})
export class SettingsTab implements OnInit, AfterViewInit {
  students: string[] = [];
  subjects: string[] = [];
  courseTimeInputValue: string = this.courseTimeState.getValue();
  studentInputValue: string = '';
  subjectInputValue: string = '';
  studentsData: Student[] | null = null;
  actionSheetButtons: ActionSheetButton[] = [];
  isSubjectsAddButtonDisabled = false;
  isStudentsAddButtonDisabled = false;
  @ViewChild('addStudentsButton', { static: true, read: ElementRef }) addStudentsButton!: ElementRef;
  @ViewChild('addSubjectsButton', { static: true, read: ElementRef }) addSubjectsButton!: ElementRef;

  constructor(
    private courseTimeState: CourseTimeInStringState,
    private studentsState: StudentsState,
    private subjectsState: SubjectsState,
    private alertController: AlertController,
    private excelExporterService: ExcelExporterService,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    this.studentsState.getState().subscribe(studentsData => {
      this.studentsData = studentsData;
      this.students = [];

      if (studentsData) {
        this.students = studentsData!.map(x => x.name);
      }

      this.actionSheetButtons = [
        {
          text: 'مسح ملفات الطلاب',
          role: 'destructive',
          handler: () => this.displayConfirmationModal(() => this.helperService.resetAllStates()),
          cssClass: 'actionSheetButtons-delete-student-files',
          icon: 'trash',
          disabled: !this.studentsData
        },
        {
          text: 'تصدير ملفات الطلاب الى ملف اكسل',
          handler: () => this.excelExporterService.exportStudentsDataToExcel(this.studentsData),
          disabled: !this.studentsData,
          icon: 'download'
        }
      ]
    });

    this.subjectsState.getState().subscribe((subjectStateValue) => {
      this.subjects = [];

      if (subjectStateValue) {
        this.subjects = subjectStateValue;
      }
    });
  }

  ngAfterViewInit(): void {
    // Implementing throttling for double click prevention
    // Also implemented disable button
    fromEvent(this.addStudentsButton.nativeElement, 'click')
      .pipe(
        throttleTime(1000),
        tap(() => this.addStudent())
      )
      .subscribe();

    fromEvent(this.addSubjectsButton.nativeElement, 'click')
      .pipe(
        throttleTime(1000),
        tap(() => this.addSubject())
      )
      .subscribe();
  }

  async displayConfirmationModal(callbackFunction: any) {
    const alert = await this.alertController.create({
      header: 'تنبيه!',
      message: 'هل انت متأكد من القيام بالحذف؟',
      buttons: [
        {
          text: 'اغلاق',
          htmlAttributes: {
            'aria-label': 'close',
          },
        },
        {
          text: 'حذف',
          handler: async () => {
            callbackFunction()
            await alert.dismiss();
          },
          cssClass: 'alertController-delete-students-files'
        },
      ],
    });

    alert.dir = 'rtl'
    await alert.present();
  }

  addStudent() {
    if (!this.studentInputValue.trim()) return;
    this.isStudentsAddButtonDisabled = true;

    const previousState = this.studentsState.getValue();
    const isStudentExist = previousState ? previousState?.filter(x => x.name.includes(this.studentInputValue)).length > 0 : false;

    if (!isStudentExist) {
      this.saveStudentToState(this.studentInputValue);
    }

    this.studentInputValue = '';
    this.isStudentsAddButtonDisabled = false;
  }

  addSubject() {
    if (!this.subjectInputValue.trim()) return;
    this.isSubjectsAddButtonDisabled = true;

    const previousState = this.subjectsState.getValue();
    const isSubjectExist = previousState !== null ? previousState?.filter(x => x.includes(this.subjectInputValue)).length > 0 : false;

    if (!isSubjectExist) {
      this.saveSubjectToState(this.subjectInputValue);
    }

    this.subjectInputValue = '';
    this.isSubjectsAddButtonDisabled = false;
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
}
