import React, { FC } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Categories } from '@reprman/types'

export type CategoryPillsProps = {
  categories: Categories
  onPress?: (category: string) => void
}

const CategoryPills: FC<CategoryPillsProps> = ({
  categories,
  onPress = () => {},
}) => {
  const sorted = [...categories].sort((a, b) => a.localeCompare(b))

  return (
    <View style={styles.container}>
      {sorted.map((category) => (
        <Pressable
          key={category}
          style={styles.pill}
          onPress={() => onPress(category)}
        >
          <Text style={styles.pillText}>{category}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: '#0c63e4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
})

export default CategoryPills
