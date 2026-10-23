package com.magnolia.api.usuario;

public record UsuarioResponse(Long id, String nome, String email, Papel papel) {

	public static UsuarioResponse de(Usuario usuario) {
		return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPapel());
	}
}
