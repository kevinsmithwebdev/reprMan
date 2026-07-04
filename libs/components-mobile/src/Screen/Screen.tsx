import React, { FC, ReactNode } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export type ScreenProps = {
  children: ReactNode
  scroll?: boolean
  testID?: string
}

const Screen: FC<ScreenProps> = ({ children, scroll = false, testID }) => {
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  )

  return (
    <SafeAreaView style={styles.safe} testID={testID}>
      {content}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
})

export default Screen
