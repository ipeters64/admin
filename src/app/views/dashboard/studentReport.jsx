import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid } from '@material-ui/core';
import { toast } from 'react-toastify';

import bc from '../../services/breathecode';
import StudentIndicators from './components/StudentIndicators';
import StudentInformation from './components/StudentInformation';
import CohortStudentActivity from './components/CohortStudentActivity';

toast.configure();
const toastOption = {
  position: toast.POSITION.BOTTOM_RIGHT,
  autoClose: 8000,
};

const studentReport = () => {
  const [query, setQuery] = useState({ limit: 10, offset: 0 });
  const [cohortUsersQuery, setCohortUsersQuery] = useState({
    roles: 'TEACHER,ASSISTANT',
  });
  const { studentID, cohortID } = useParams();
  const studentAttendanceQuery = {
    limit: 60,
    offset: 0,
    user_id: studentID,
  };
  const [cohortData, setCohortData] = useState({});
  const [studentData, setStudentData] = useState({});
  const [studentStatus, setStudentStatus] = useState({});
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [studentActivity, setStudentActivity] = useState([]);
  const [studenAttendance, setStudenAttendance] = useState([]);
  const [hasMoreActivity, setHasMoreActivity] = useState(0);

  // cohort data
  useEffect(() => {
    bc.admissions()
      .getCohort(cohortID)
      .then(({ data }) => {
        if (!data) {
          toast.error('Cohort not Found', toastOption);
        }
        setCohortData(data);
        setCohortUsersQuery({ ...cohortUsersQuery, cohorts: data.slug });
      })
      .catch((err) => console.error(err));
  }, []);

  // cohort teacher
  useEffect(() => {
    if (
      Object.keys(cohortUsersQuery).length !== 0
      && cohortUsersQuery.constructor === Object
      && 'cohorts' in cohortUsersQuery
    ) {
      bc.admissions()
        .getAllUserCohorts(cohortUsersQuery)
        .then(({ data }) => {
          setCohortData({ ...cohortData, teachers: data });
        })
        .catch((err) => console.error(err));
    }
  }, [cohortUsersQuery]);

  // student info
  useEffect(() => {
    bc.auth()
      .getAcademyMember(studentID)
      .then(({ data }) => {
        setStudentData(data);
        setQuery({ ...query, user_id: data.user.id });
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    bc.admissions()
      .getSingleCohortStudent(cohortID, studentID)
      .then(({ data }) => {
        setStudentStatus(data);
        setQuery({ ...query, user_id: data.user.id });
      })
      .catch((err) => console.error(err));
  }, []);

  // student assignments
  useEffect(() => {
    bc.assignments()
      .getStudentAssignments(studentID)
      .then(({ data }) => {
        setStudentAssignments(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // cohort activity
  useEffect(() => {
    if (Object.keys(query).length !== 0 && query.constructor === Object && query.user_id) {
      bc.activity()
        .getCohortActivity(cohortID, query)
        .then(({ data }) => {
          const newData = data?.results || [];
          setHasMoreActivity(data?.next);
          setStudentActivity(
            studentActivity.length !== 0 ? [...studentActivity, ...newData] : data?.results || [],
          );
        })
        .catch((err) => console.error(err));
    }
  }, [query]);

  // Attendance data
  useEffect(() => {
    bc.activity()
      .getCohortActivity(cohortID, studentAttendanceQuery)
      .then(({ data }) => {
        setStudenAttendance(data?.results || []);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <div className=" pt-7 px-8 bg-primary text-white flex mb-8">
        <Grid item lg={3} md={3} sm={12} xs={12}>
          <div className="py-8" />
          <StudentInformation data={studentData} studentStatus={studentStatus} />
        </Grid>
        <Grid item lg={9} md={9} sm={12} xs={12}>
          <div className="py-8" />
          <StudentIndicators
            data={studentAssignments}
            studentActivity={studentActivity}
            studenAttendance={studenAttendance}
            studentData={studentData}
          />
        </Grid>
      </div>
      <div className="pb-24 pt-7 px-8 bg-default text-grey flex">
        <CohortStudentActivity
          data={studentAssignments}
          studentActivity={studentActivity}
          cohortData={cohortData}
          setQuery={setQuery}
          query={query}
          hasMoreActivity={hasMoreActivity}
        />
      </div>
    </>
  );
};

export default studentReport;
