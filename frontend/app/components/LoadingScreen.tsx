export default function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 bg-opacity-50">
      <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-t-4 border-white rounded-full" role="status">
      ___
      </div>
      <span className="visually-hidden">&nbsp; &nbsp;Loading...</span>
    </div>
  );
}