import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/config.dart';
import '../services/api_service.dart';

class ConfigsNotifier extends AsyncNotifier<List<Config>> {
  @override
  Future<List<Config>> build() async {
    return apiService.getConfigs();
  }

  Future<void> create(String key, String value) async {
    state = const AsyncValue.loading();
    try {
      final newItem = await apiService.createConfig(key, value);
      state = AsyncValue.data([newItem, ...?state.value]);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> delete(int id) async {
    try {
      await apiService.deleteConfig(id);
      state = AsyncValue.data(state.value?.where((item) => item.id != id).toList() ?? []);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final configsProvider = AsyncNotifierProvider<ConfigsNotifier, List<Config>>(() {
  return ConfigsNotifier();
});
