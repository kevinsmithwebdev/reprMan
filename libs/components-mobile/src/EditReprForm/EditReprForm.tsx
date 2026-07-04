import React, { FC, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { getComplement } from '@reprman/utilities'
import { Repr, useReprs } from '@reprman/state/reprs'
import { addReprSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import { useCategories } from '@reprman/state/categories'
import {
  useReprCreationCap,
  selectAtReprLimit,
  selectSubscription,
} from '@reprman/state/reprsQuota'
import { useL10n } from '@reprman/localization'
import {
  addCategory,
  addPillCategory,
  findFormErrors,
  removeCategory,
  ReprForm,
  ReprFormErrors,
} from '@reprman/modals/EditRepr/EditRepr.helpers'
import CategoryPills from '../CategoryPills'
import PrimaryButton from '../PrimaryButton'
import TextField from '../TextField'

export type EditReprFormProps = {
  reprId?: string
}

const EditReprForm: FC<EditReprFormProps> = ({ reprId }) => {
  const dispatch = useDispatch()
  const { t } = useL10n()
  const router = useRouter()
  const { categories: availableCategories } = useCategories()
  const [enteredCategory, setEnteredCategory] = useState('')
  const { getRepr } = useReprs()
  const { quotaLoaded, reprCreationCap } = useReprCreationCap()
  const atLimit = useSelector(selectAtReprLimit)
  const subscription = useSelector(selectSubscription)
  const repr = reprId && reprId !== 'new' ? getRepr(reprId) : undefined
  const isCreateMode = !repr
  const initialCategories = repr?.categories ?? []
  const initialTitle = repr?.title ?? ''
  const initialComment = repr?.comment ?? ''
  const initialLearning = repr?.learning === true
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [form, setForm] = useState<ReprForm>({
    title: initialTitle,
    categoryInput: '',
    comment: initialComment,
    learning: initialLearning,
  })
  const [errors, setErrors] = useState<ReprFormErrors>({})

  const categoriesComplement = getComplement(availableCategories, categories)
  const isTitleValid = form.title.length >= 1
  const categoriesDirty =
    categories.length !== initialCategories.length ||
    categories.some((category, index) => category !== initialCategories[index])
  const isDirty =
    form.title !== initialTitle ||
    form.comment !== initialComment ||
    form.learning !== initialLearning ||
    categoriesDirty
  const disableSave = !isTitleValid || (!isCreateMode && !isDirty)

  const close = () => router.back()

  if (!quotaLoaded) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>
          {t('modals.editRepr.quotaUnavailable.title')}
        </Text>
        <Text>{t('modals.editRepr.quotaUnavailable.body')}</Text>
      </View>
    )
  }

  const limitCap = subscription?.maxReprs ?? reprCreationCap
  if (isCreateMode && atLimit && limitCap !== null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>{t('modals.editRepr.exceeded.title')}</Text>
        <Text>{t('modals.editRepr.exceeded.body', { num: limitCap })}</Text>
        <PrimaryButton label={t('buttons.closeWithoutSave')} onPress={close} />
      </View>
    )
  }

  const setField = (field: keyof ReprForm, value: string | boolean) => {
    setForm({ ...form, [field]: value })
  }

  const save = () => {
    const foundErrors = findFormErrors({
      form,
      categories,
      enteredCategory,
      t,
    })

    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors)
      return
    }

    const thisRepr: Repr = {
      id: repr?.id ?? '',
      title: form.title,
      categories,
      dateCreated: repr?.dateCreated ?? Number.NaN,
      datesPracticed: repr?.datesPracticed ?? [],
      comment: form.comment,
      learning: form.learning,
    }
    dispatch(addReprSAC(thisRepr))
    close()
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isCreateMode
          ? t('modals.editRepr.createTitle')
          : t('modals.editRepr.title')}
      </Text>
      <TextField
        label={t('pages.viewRepr.data.title')}
        value={form.title}
        onChangeText={(value) => setField('title', value)}
        error={errors.title}
        testID="edit-repr-title"
      />
      <Text style={styles.sectionLabel}>
        {t('pages.viewRepr.data.categories')}
      </Text>
      <Text style={styles.subLabel}>{t('modals.editRepr.current')}:</Text>
      {categories.length ? (
        categories.map((category) => (
          <Pressable
            key={category}
            onPress={() => removeCategory(category, categories, setCategories)}
          >
            <Text style={styles.removableCategory}>- {category}</Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.muted}>
          {t('modals.editRepr.noCategoriesSelected')}
        </Text>
      )}
      {!!categoriesComplement.length && (
        <>
          <Text style={styles.subLabel}>{t('modals.editRepr.available')}:</Text>
          <CategoryPills
            categories={categoriesComplement}
            onPress={(category) =>
              addPillCategory(category, categories, setCategories)
            }
          />
        </>
      )}
      <Text style={styles.subLabel}>
        {t('modals.editRepr.addNewCategory')}:
      </Text>
      <View style={styles.categoryRow}>
        <TextField
          value={enteredCategory}
          onChangeText={setEnteredCategory}
          error={errors.categoryInput}
          style={styles.categoryInput}
        />
        <PrimaryButton
          label="+"
          onPress={() =>
            addCategory({
              form,
              setErrors,
              categories,
              setCategories,
              enteredCategory,
              setEnteredCategory,
              t,
            })
          }
          style={styles.addCategoryButton}
        />
      </View>
      <TextField
        label={t('pages.viewRepr.data.comment')}
        value={form.comment}
        onChangeText={(value) => setField('comment', value)}
        error={errors.comment}
      />
      <Pressable
        style={styles.learningRow}
        onPress={() => setField('learning', !form.learning)}
      >
        <View style={[styles.checkbox, form.learning && styles.checkboxOn]} />
        <Text>{t('modals.editRepr.learningLabel')}</Text>
      </Pressable>
      <Text style={styles.muted}>{t('modals.editRepr.learningHelp')}</Text>
      <View style={styles.footer}>
        <PrimaryButton
          label={t('buttons.closeWithoutSave')}
          variant="danger"
          onPress={close}
          style={styles.footerButton}
        />
        <PrimaryButton
          label={t('buttons.save')}
          variant="success"
          disabled={disableSave}
          onPress={save}
          style={styles.footerButton}
          testID="edit-repr-save"
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    color: '#222',
  },
  sectionLabel: {
    fontWeight: '800',
    marginBottom: 8,
    color: '#222',
  },
  subLabel: {
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 6,
    color: '#333',
  },
  muted: {
    color: '#666',
    marginBottom: 8,
  },
  removableCategory: {
    color: '#0c63e4',
    marginBottom: 4,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  categoryInput: {
    flex: 1,
  },
  addCategoryButton: {
    width: 48,
    minHeight: 48,
  },
  learningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
  },
  checkboxOn: {
    backgroundColor: '#0c63e4',
    borderColor: '#0c63e4',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  footerButton: {
    flex: 1,
  },
})

export default EditReprForm
