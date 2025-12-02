// TODO: Implement job creation form component
// This component should allow employers to create new job postings
// 
// Requirements:
// - Form fields: title, description, field, skills (comma-separated), type, location
// - Form validation using utils/validation.js functions
// - Submit job creation mutation (CREATE_JOB from graphql/mutations.js)
// - Show success/error messages
// - Reset form after successful creation
// - Notify parent component (Dashboard) when job is created
//
// See client/src/utils/validation.js for validation functions:
// - validateJobTitle
// - validateJobDescription
// - validateJobField
// - validateJobLocation
// - validateJobType
//
// CSS: Use client/src/components/CreateJobForm.css (currently empty, add styles when implementing)
//
// Example usage in Dashboard.js:
// import CreateJobForm from '../../components/CreateJobForm';
// 
// const handleJobCreated = (newJob) => {
//   loadJobs(filters); // Reload jobs list
// };
//
// {user?.userType === 'employer' && (
//   <CreateJobForm onJobCreated={handleJobCreated} employerId={user?.id} />
// )}

export default function CreateJobForm() {
  return (
    <div>
      <p>Job creation form - To be implemented</p>
    </div>
  );
}
