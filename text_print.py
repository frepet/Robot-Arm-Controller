import pygame


class TextPrint:
    def __init__(self, pos):
        self.pos = pygame.Vector2(pos)
        self.cursor = self.pos
        self.line_height = 20
        self.reset()
        self.font = pygame.font.Font(None, int(self.line_height*1.1))

    def print(self, screen, text_string, color="white"):
        text_bitmap = self.font.render(text_string, True, color)
        screen.blit(text_bitmap, self.pos)
        self.cursor[1] += self.line_height

    def reset(self):
        self.cursor = self.pos

    def indent(self):
        self.cursor[0] += 20

    def unindent(self):
        self.cursor[0] -= 20
