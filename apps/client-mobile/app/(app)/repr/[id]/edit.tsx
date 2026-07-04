import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { EditReprForm } from '@reprman/components-mobile'

const EditReprScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <EditReprForm reprId={id} />
}

export default EditReprScreen
