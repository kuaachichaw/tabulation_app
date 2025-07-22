import { BiSolidUser } from "react-icons/bi";

export const AnimatedToggle = ({ isOn, onClick, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-500',
    pink: 'bg-pink-500',
    blue: 'bg-blue-500',
  };

  return (
    <div 
      onClick={onClick}
      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        isOn ? colorClasses[color] : 'bg-gray-400'
      }`}
    >
      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
        isOn ? 'translate-x-7' : ''
      }`}/>
    </div>
  );
};