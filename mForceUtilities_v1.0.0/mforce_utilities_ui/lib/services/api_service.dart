import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/config.dart';

class ApiService {
  static const String baseUrl = '/api/v1';

  Future<List<Config>> getConfigs() async {
    final response = await http.get(Uri.parse('$baseUrl/configs'));
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((json) => Config.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch');
  }

  Future<Config> createConfig(String key, String value) async {
    final response = await http.post(
      Uri.parse('$baseUrl/configs'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'key': key,
        'value': value,
      }),
    );
    if (response.statusCode == 200) {
      return Config.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to create');
  }

  Future<void> deleteConfig(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/configs/$id'));
    if (response.statusCode != 200) {
      throw Exception('Failed to delete');
    }
  }
}

final apiService = ApiService();
