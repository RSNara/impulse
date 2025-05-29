import { Modal, View } from 'react-native';
import IUIButton from './IUIButton';

export default function IUIModal({
  visible,
  onRequestClose,
  children,
  onReceiveSize,
}: {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  onReceiveSize?: (size: { width: number; height: number }) => void;
}) {
  return (
    <Modal
      animationType="fade"
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 20,
          paddingVertical: 200,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <View
          style={{ backgroundColor: 'white', borderRadius: 10, padding: 15 }}
          onLayout={
            onReceiveSize
              ? (event) => {
                  const { width, height } = event.nativeEvent.layout;
                  onReceiveSize({
                    width: width - 15 * 2,
                    height: height - 15 * 2,
                  });
                }
              : undefined
          }
        >
          {children}
          <View style={{ marginBottom: 10 }}>
            <IUIButton
              type="secondary"
              feeling="neutral"
              onPress={onRequestClose}
            >
              Cancel
            </IUIButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}
