import React, { FC } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { ConfirmationModalResponse } from '@reprman/modals/ModalContainer/ModalContainer.types'
import { useL10n } from '@reprman/localization'
import { clearModal } from '@reprman/state/modal'
import PrimaryButton from '@reprman/components-mobile/PrimaryButton'

export type ConfirmationModalProps = {
  title: string
  body: string
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({ title, body }) => {
  const dispatch = useDispatch()
  const { t } = useL10n()

  const closeModal = () => dispatch(clearModal())

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
            <PrimaryButton
              label={t('common.yes')}
              variant="success"
              onPress={() => {
                dispatch({ type: ConfirmationModalResponse.YES })
                closeModal()
              }}
              style={styles.action}
            />
            <PrimaryButton
              label={t('common.no')}
              variant="danger"
              onPress={() => {
                dispatch({ type: ConfirmationModalResponse.NO })
                closeModal()
              }}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  body: {
    color: '#333',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  action: {
    flex: 1,
  },
})

export default ConfirmationModal
