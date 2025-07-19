interface CheckPageProps {
  params: Promise<{
    checkId: string;
  }>;
}

const CheckPage = async ({ params }: CheckPageProps) => {
  const { checkId } = await params;

  return <div>{checkId}</div>;
};

export default CheckPage;
