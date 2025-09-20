const Alert = ({ type, text }) => {
  return (
    <div className='fixed top-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center z-50 px-4'>
      <div
        className={`p-4 max-w-md w-full mx-auto shadow-lg rounded-lg ${
          type === "danger" ? "bg-red-50 border-red-200 border" : "bg-green-50 border-green-200 border"
        } items-center leading-none flex`}
        role='alert'
      >
        <div
          className={`flex rounded-full ${
            type === "danger" ? "bg-red-500" : "bg-green-500"
          } uppercase px-3 py-1 text-xs font-semibold mr-3 text-white`}
        >
          {type === "danger" ? "Failed" : "Success"}
        </div>
        <p className={`flex-1 text-sm font-medium whitespace-pre-line ${
          type === "danger" ? "text-red-800" : "text-green-800"
        }`}>{text}</p>
      </div>
    </div>
  );
};

export default Alert;