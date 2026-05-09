function studentDto(student) {
  return {
    id:             student.id,
    user_id:        student.user_id,
    student_number: student.student_number,
    class_id:       student.class_id,
    date_of_birth:  student.date_of_birth,
    first_name:     student.first_name,
    last_name:      student.last_name,
    email:          student.email,
    phone:          student.phone,
    created_at:     student.created_at,
  };
}

module.exports = studentDto;
