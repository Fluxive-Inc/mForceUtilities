import 'package:flutter/material.dart';
import 'command_deck_theme.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'state/configs_provider.dart';
import 'orbital_protocol.dart';

void main() {
  initOrbital();
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: orbitalMode,
      builder: (context, mode, _) => MaterialApp(
        title: 'System Utilities',
        themeMode: mode,
        theme: CommandDeck.solar(CommandDeck.accentDefault),
        darkTheme: CommandDeck.lunar(CommandDeck.accentDefault),
        home: const DashboardScreen(),
      ),
    );
  }
}

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(configsProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Utilities'),
      ),
      body: state.when(
        data: (items) {
          if (items.isEmpty) return const Center(child: Text('No records found'));
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                title: Text(item.key),
                subtitle: Text(item.value),
                trailing: IconButton(
                  icon: const Icon(Icons.delete),
                  onPressed: () {
                    if (item.id != null) ref.read(configsProvider.notifier).delete(item.id!);
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ref.read(configsProvider.notifier).create('Test key', 'Test value');
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
