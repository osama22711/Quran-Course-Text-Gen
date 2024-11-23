import { Store } from "./generic-store";
import { Student } from "./interfaces/student.interface";

export class CourseTimeInStringState extends Store<string> {
  constructor() {
    super("الساعة السادسة والنصف الى صلاة المغرب", "courseWhen");
  }
}

export class StudentsState extends Store<Student[] | null> {
  constructor() {
    super(null, "students");
  }
}

export class SubjectsState extends Store<string[] | null> {
  constructor() {
    super(null, "subjects");
  }
}