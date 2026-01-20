import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.bgDark,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 10,

  },
  topSection: {
    flexDirection: 'row',
    height: 240,
    marginTop: 10,
    marginBottom: 4,
  },
});
