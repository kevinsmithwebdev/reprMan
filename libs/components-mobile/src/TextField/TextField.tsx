import React, { FC } from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'

export type TextFieldProps = TextInputProps & {
  label?: string
  error?: string
}

const TextField: FC<TextFieldProps> = ({
  label,
  error,
  style,
  ...inputProps
}) => (
  <View style={styles.container}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      style={[styles.input, error ? styles.inputError : null, style]}
      placeholderTextColor="#888"
      {...inputProps}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
)

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  error: {
    color: '#dc3545',
    marginTop: 4,
    fontSize: 13,
  },
})

export default TextField
