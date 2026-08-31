class Config {
  final int? id;
  final String key;
  final String value;

  Config({this.id, required this.key, required this.value});

  factory Config.fromJson(Map<String, dynamic> json) {
    return Config(
      id: json['id'] as int?,
      key: json['key'] as String? ?? '',
      value: json['value'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'key': key,
      'value': value,
    };
  }
}
