const FlexContainer = ({ children, className = "" }) => {
    return (
      <div className={`flex w-full px-8 py-6  mx-auto sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {children}
      </div>
    );
  };
  
  export default FlexContainer;
  