import React, { FC } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

const LoadingOverlay: FC = () => (
  <View style={styles.container} testID="loading-overlay">
    <ActivityIndicator size="large" color="#0c63e4" />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default LoadingOverlay
