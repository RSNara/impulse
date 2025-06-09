import { useEffect, useState } from 'react';

export default function IUIDelayedStubber({
  isVisible,
  stub,
  children,
}: {
  isVisible: boolean;
  stub: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isStubbed, setIsStubbed] = useState(false);
  useEffect(() => {
    if (!isVisible) {
      let id = setTimeout(() => {
        setIsStubbed(true);
      }, 250);

      return () => {
        clearTimeout(id);
      };
    } else {
      setIsStubbed(false);
    }
  }, [isVisible]);

  if (isStubbed) {
    return stub;
  }

  return children;
}
