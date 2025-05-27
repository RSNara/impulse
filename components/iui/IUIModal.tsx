import { Modal, View } from 'react-native';
import IUIButton from './IUIButton';

export default function IUIModal({
  visible,
  onRequestClose,
  children,
}: {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
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
