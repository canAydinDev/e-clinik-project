interface PageProps {
  params: { patientId: string };
}

const Page = ({ params }: PageProps) => {
  const { patientId } = params;
  return (
    <div>
      <div>Exam home</div>
      <h1>{patientId}</h1>
    </div>
  );
};

export default Page;
