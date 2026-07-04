import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSelector } from 'react-redux'
import { useL10n } from '@reprman/localization'
import { selectAtReprLimit } from '@reprman/state/reprsQuota'
import PrimaryButton from '../PrimaryButton'

const AddReprButton: FC = () => {
  const { t } = useL10n()
  const router = useRouter()
  const atLimit = useSelector(selectAtReprLimit)

  return (
    <PrimaryButton
      label={t('buttons.addReprButton')}
      variant="success"
      disabled={atLimit}
      onPress={() => router.push('/(app)/repr/new/edit')}
      style={styles.button}
      testID="add-repr-button"
    />
  )
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
})

export default AddReprButton
