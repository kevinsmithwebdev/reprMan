import loadSettingsSaga from './loadSettings/loadSettings.saga'
import resetSettingsSaga from './resetSettings/resetSettings.saga'
import setSettingsSaga from './setSettings/setSettings.saga'

export default [...loadSettingsSaga, ...resetSettingsSaga, ...setSettingsSaga]
