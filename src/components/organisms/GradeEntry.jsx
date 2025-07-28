import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const GradeEntry = ({ students, assignments, grades, onSubmit, loading = false }) => {
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [gradeEntries, setGradeEntries] = useState({});

  useEffect(() => {
    if (selectedAssignment && students.length > 0) {
      const entries = {};
      students.forEach(student => {
        const existingGrade = grades.find(g => 
          g.studentId === student.Id && g.assignmentId === parseInt(selectedAssignment)
        );
        entries[student.Id] = {
          score: existingGrade ? existingGrade.score.toString() : "",
          gradeId: existingGrade ? existingGrade.Id : null
        };
      });
      setGradeEntries(entries);
    }
  }, [selectedAssignment, students, grades]);

  const handleScoreChange = (studentId, score) => {
    setGradeEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: score
      }
    }));
  };

  const calculateGrade = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { letter: "A", variant: "success" };
    if (percentage >= 80) return { letter: "B", variant: "info" };
    if (percentage >= 70) return { letter: "C", variant: "warning" };
    if (percentage >= 60) return { letter: "D", variant: "warning" };
    return { letter: "F", variant: "error" };
  };

  const handleSaveGrades = () => {
    if (!selectedAssignment) return;

    const assignment = assignments.find(a => a.Id === parseInt(selectedAssignment));
    if (!assignment) return;

    const gradesToSave = Object.entries(gradeEntries)
      .filter(([_, entry]) => entry.score.trim() !== "")
      .map(([studentId, entry]) => ({
        Id: entry.gradeId,
        studentId: parseInt(studentId),
        assignmentId: parseInt(selectedAssignment),
        score: parseFloat(entry.score),
        maxScore: assignment.points,
        dateRecorded: new Date().toISOString()
      }));

    onSubmit(gradesToSave);
  };

  const selectedAssignmentData = assignments.find(a => a.Id === parseInt(selectedAssignment));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 font-display mb-2">
            Grade Entry
          </h2>
          <p className="text-gray-600">
            Select an assignment and enter grades for students
          </p>
        </div>

        <div className="mb-6">
          <Select
            label="Select Assignment"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
          >
            <option value="">Choose an assignment</option>
            {assignments.map(assignment => (
              <option key={assignment.Id} value={assignment.Id}>
                {assignment.name} ({assignment.points} points) - Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </option>
            ))}
          </Select>
        </div>

        {selectedAssignmentData && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-primary-900">{selectedAssignmentData.name}</h3>
                <p className="text-sm text-primary-700">
                  Type: {selectedAssignmentData.type} | Points: {selectedAssignmentData.points}
                </p>
              </div>
              <Badge variant="primary">
                Due: {new Date(selectedAssignmentData.dueDate).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        )}
      </Card>

      {selectedAssignment && students.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Student Grades</h3>
              <Button onClick={handleSaveGrades} loading={loading}>
                Save All Grades
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const entry = gradeEntries[student.Id] || { score: "" };
                  const score = parseFloat(entry.score) || 0;
                  const maxScore = selectedAssignmentData?.points || 100;
                  const percentage = entry.score ? (score / maxScore) * 100 : 0;
                  const grade = entry.score ? calculateGrade(score, maxScore) : { letter: "-", variant: "default" };

                  return (
                    <tr key={student.Id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mr-4">
                            <span className="text-primary-600 font-medium">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          min="0"
                          max={maxScore}
                          step="0.5"
                          value={entry.score}
                          onChange={(e) => handleScoreChange(student.Id, e.target.value)}
                          placeholder="0"
                          className="w-20"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {maxScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={grade.variant}>
                          {grade.letter}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.score ? `${percentage.toFixed(1)}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GradeEntry;