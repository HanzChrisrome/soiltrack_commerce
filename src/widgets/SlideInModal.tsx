import { useEffect, useState } from "react";

interface SlideInModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SlideInModal: React.FC<SlideInModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true); // show when opened
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false); // trigger slide-out
    setTimeout(() => {
      onClose(); // unmount after animation
    }, 300); // matches duration-300
  };

  if (!visible && !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div
        className={`ml-auto h-full w-full max-w-lg bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Pass down close handler if needed */}
        {children}
      </div>
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleClose} />
    </div>
  );
};

export default SlideInModal;
